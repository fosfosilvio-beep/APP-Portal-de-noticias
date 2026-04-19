"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Type, 
  Heading1, 
  Heading2, 
  RotateCcw,
  Palette,
  Type as TypeIcon
} from "lucide-react";
import { useState } from "react";

// Extensão customizada de Tamanho de Fonte
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark("textStyle", { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
      },
    } as any;
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [showColors, setShowColors] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-500 underline cursor-pointer" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontFamily,
      Color,
      FontSize,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[400px] p-6 text-slate-300 font-inter",
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Digite a URL do link:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const colors = [
    { name: "Branco", value: "#FFFFFF" },
    { name: "Cinza", value: "#94a3b8" },
    { name: "Vermelho", value: "#ef4444" },
    { name: "Azul", value: "#3b82f6" },
    { name: "Verde", value: "#10b981" },
    { name: "Amarelo", value: "#f59e0b" },
    { name: "Preto", value: "#000000" },
  ];

  const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "30px", "36px", "48px"];

  return (
    <div className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-neutral-700">
      
      {/* Toolbar Superior */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-neutral-900 border-b border-neutral-800 backdrop-blur-md sticky top-0 z-10">
        
        {/* Font Family Selector */}
        <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 mr-2 border border-white/5">
          <button
            onClick={() => editor.chain().focus().setFontFamily("var(--font-inter)").run()}
            className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${editor.isActive("textStyle", { fontFamily: "var(--font-inter)" }) ? "bg-blue-600 text-white shadow-lg" : "text-neutral-500 hover:text-white"}`}
          >
            SANS
          </button>
          <button
            onClick={() => editor.chain().focus().setFontFamily("var(--font-merriweather)").run()}
            className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${editor.isActive("textStyle", { fontFamily: "var(--font-merriweather)" }) ? "bg-blue-600 text-white shadow-lg" : "text-neutral-500 hover:text-white"}`}
          >
            SERIF
          </button>
          <button
            onClick={() => editor.chain().focus().setFontFamily("var(--font-montserrat)").run()}
            className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${editor.isActive("textStyle", { fontFamily: "var(--font-montserrat)" }) ? "bg-blue-600 text-white shadow-lg" : "text-neutral-500 hover:text-white"}`}
          >
            MONTS
          </button>
        </div>

        {/* Font Size Dropdown Simulado */}
        <div className="relative mr-2 border-r border-neutral-800 pr-2">
          <button 
            onClick={() => { setShowSizes(!showSizes); setShowColors(false); }}
            className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${showSizes ? "bg-blue-600 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
            title="Tamanho da Fonte"
          >
            <TypeIcon size={18} />
            <span className="hidden sm:inline">Tamanho</span>
          </button>
          {showSizes && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 grid grid-cols-2 gap-1 min-w-[120px] animate-in fade-in zoom-in duration-200">
              {fontSizes.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    // @ts-ignore
                    editor.chain().focus().setFontSize(size).run();
                    setShowSizes(false);
                  }}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:bg-blue-600 hover:text-white rounded-lg text-left transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Multi-Color Picker Simulado */}
        <div className="relative mr-2 border-r border-neutral-800 pr-2">
          <button 
            onClick={() => { setShowColors(!showColors); setShowSizes(false); }}
            className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-all ${showColors ? "bg-blue-600 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
            title="Cor do Texto"
          >
            <Palette size={18} />
            <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#FFFFFF" }}></div>
          </button>
          {showColors && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 grid grid-cols-4 gap-2 min-w-[160px] animate-in fade-in zoom-in duration-200">
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => {
                    editor.chain().focus().setColor(color.value).run();
                    setShowColors(false);
                  }}
                  className="w-6 h-6 rounded-full border border-white/10 hover:scale-125 transition-transform shadow-sm"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              <button 
                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColors(false); }}
                className="col-span-4 text-[10px] font-bold text-neutral-500 pt-2 border-t border-neutral-800 hover:text-white"
              >
                Resetar Cor
              </button>
            </div>
          )}
        </div>

        {/* Basic Styles (Bold, Italic, Underline) */}
        <div className="flex items-center gap-1 mr-2 border-r border-neutral-800 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive("bold") ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive("italic") ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive("underline") ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
          >
            <UnderlineIcon size={18} />
          </button>
        </div>

        {/* Alignments */}
        <div className="flex items-center gap-1 mr-2 border-r border-neutral-800 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive({ textAlign: "left" }) ? "bg-blue-600 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
          >
            <AlignLeft size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive({ textAlign: "center" }) ? "bg-blue-600 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
          >
            <AlignCenter size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive({ textAlign: "right" }) ? "bg-blue-600 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
          >
            <AlignRight size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive({ textAlign: "justify" }) ? "bg-blue-600 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
          >
            <AlignJustify size={18} />
          </button>
        </div>

        {/* Extras: Lists, Link, Reset */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive("bulletList") ? "bg-blue-600 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={addLink}
            className={`p-2 rounded-lg transition-all ${editor.isActive("link") ? "bg-blue-600 text-white" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
          >
            <LinkIcon size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="p-2 rounded-lg text-neutral-400 hover:bg-red-500/10 hover:text-red-500 transition-all ml-4"
            title="Resetar Estilos"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Área de Conteúdo */}
      <div className="bg-neutral-950/30 min-h-[400px]">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror { outline: none !important; }
        .ProseMirror p { margin-bottom: 1.2rem; line-height: 1.7; }
        .ProseMirror h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 1.5rem; color: white; line-height: 1.2; }
        .ProseMirror h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 1.25rem; color: #f8fafc; }
        .ProseMirror ul { list-style-type: disc; padding-left: 2rem; margin-bottom: 1.5rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 2rem; margin-bottom: 1.5rem; }
        .ProseMirror a { color: #3b82f6; text-decoration: underline; text-underline-offset: 4px; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
