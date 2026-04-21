"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { supabase } from "../../lib/supabase";
import { Upload, Scissors, Check, X, Loader2 } from "lucide-react";

interface LogoCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (url: string) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, mediaWidth / mediaHeight, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function LogoCropModal({ isOpen, onClose, onSuccess }: LogoCropModalProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => setImgSrc(reader.result?.toString() || "");
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  };

  const getCroppedBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const image = imgRef.current;
      const canvas = canvasRef.current;
      if (!image || !canvas || !completedCrop) return resolve(null);

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0, 0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => resolve(blob), "image/webp", 0.92);
    });

  const handleUpload = async () => {
    const blob = await getCroppedBlob();
    if (!blob) return alert("Recorte a imagem primeiro.");

    setUploading(true);
    try {
      const fileName = `branding/logo-${Date.now()}.webp`;
      const { error } = await supabase.storage.from("media").upload(fileName, blob, {
        contentType: "image/webp",
        upsert: true,
      });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(fileName);
      onSuccess(publicUrl);
      onClose();
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-black text-slate-900 flex items-center gap-2">
            <Scissors size={18} className="text-blue-500" /> Editor de Logo
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!imgSrc ? (
            <label className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-300 rounded-2xl p-12 cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload size={40} className="text-slate-300" />
              <div className="text-center">
                <p className="font-black text-slate-700">Selecionar arquivo de logo</p>
                <p className="text-sm text-slate-400 font-medium mt-1">PNG, SVG, JPG ou WebP recomendado</p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} />
            </label>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Arraste para recortar a logo na proporção ideal
              </p>
              <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-center min-h-[250px]">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  keepSelection
                >
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    onLoad={onImageLoad}
                    alt="Logo para recortar"
                    className="max-h-[300px] object-contain"
                  />
                </ReactCrop>
              </div>

              {/* Preview */}
              {completedCrop && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Preview no Header:</span>
                  <div className="bg-black rounded-lg px-4 py-2 flex items-center">
                    <canvas
                      ref={canvasRef}
                      className="max-h-[40px] w-auto object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                </div>
              )}
              {/* Hidden canvas used for rendering */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          {imgSrc && (
            <button
              onClick={() => { setImgSrc(""); setCrop(undefined); setCompletedCrop(undefined); }}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Trocar arquivo
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!completedCrop || uploading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {uploading ? "Salvando..." : "Aplicar Logo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
