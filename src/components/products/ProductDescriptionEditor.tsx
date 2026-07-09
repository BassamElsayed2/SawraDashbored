"use client";

import {
  Editor,
  EditorProvider,
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";

interface ProductDescriptionEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

export function ProductDescriptionEditor({
  label,
  value,
  onChange,
  minHeight = "200px",
}: ProductDescriptionEditorProps) {
  return (
    <div className="sm:col-span-2 mb-[20px] sm:mb-0">
      <label className="mb-[10px] text-black dark:text-white font-medium block">
        {label}
      </label>
      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight }}
          className="rsw-editor"
        >
          <Toolbar>
            <BtnUndo />
            <BtnRedo />
            <Separator />
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
            <BtnClearFormatting />
            <HtmlButton />
            <Separator />
            <BtnStyles />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  );
}
