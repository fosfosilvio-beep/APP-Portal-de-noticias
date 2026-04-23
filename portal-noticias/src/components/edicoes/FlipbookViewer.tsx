"use client";

import { useState, useRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configura o worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function FlipbookViewer({ pdfUrl }: { pdfUrl: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [windowWidth, setWindowWidth] = useState(1000);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const nextButtonClick = () => {
    if (bookRef.current) bookRef.current.pageFlip().flipNext();
  };

  const prevButtonClick = () => {
    if (bookRef.current) bookRef.current.pageFlip().flipPrev();
  };

  // Calcula tamanho ideal da página baseado na tela
  const getPageWidth = () => {
    if (windowWidth < 640) return windowWidth - 40; // Mobile
    if (windowWidth < 1024) return (windowWidth - 80) / 2; // Tablet
    return 450; // Desktop
  };
  
  const getPageHeight = () => {
    const w = getPageWidth();
    return w * 1.414; // Proporção A4 padrão
  };

  const isMobile = windowWidth < 640;

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
      {/* Controles do Flipbook */}
      <div className="flex items-center justify-between w-full mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{Math.round(scale * 100)}%</span>
          <button 
            onClick={() => setScale(s => Math.min(2.5, s + 0.2))}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ZoomIn size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={prevButtonClick} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full transition-colors shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">
            {pageNumber} / {numPages || "?"}
          </span>
          <button onClick={nextButtonClick} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full transition-colors shadow-sm">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Renderizador do PDF no Flipbook */}
      <div className="relative flex justify-center items-center w-full overflow-hidden bg-slate-100 rounded-3xl p-4 sm:p-10 shadow-inner border border-slate-200" style={{ minHeight: getPageHeight() + 80 }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Baixando Edição...</p>
            </div>
          }
          error={<div className="text-rose-500 font-bold">Erro ao carregar o PDF. Verifique o arquivo.</div>}
        >
          {numPages > 0 && (
            <div className="shadow-2xl" style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.3s ease' }}>
              {/* HTMLFlipBook is not typed perfectly in @types, ignoring children errors safely */}
              {/* @ts-ignore */}
              <HTMLFlipBook
                width={getPageWidth()}
                height={getPageHeight()}
                size="fixed"
                minWidth={300}
                maxWidth={1000}
                minHeight={400}
                maxHeight={1500}
                drawShadow={true}
                flippingTime={1000}
                usePortrait={isMobile}
                startPage={0}
                showCover={true}
                mobileScrollSupport={true}
                className="flipbook-wrapper"
                ref={bookRef}
                onFlip={(e: any) => setPageNumber(e.data + 1)}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="bg-white border border-slate-200 overflow-hidden">
                    <Page 
                      pageNumber={index + 1} 
                      width={getPageWidth()}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="bg-white"
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          )}
        </Document>
      </div>
    </div>
  );
}
