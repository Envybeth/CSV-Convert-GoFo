import React from "react";

type FileDropProps = {
    onFile: (file: File) => void;
};

export default function FileDrop({ onFile }: FileDropProps){
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if(file) onFile(file);
    }

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
        if (file) onFile(file);
  };

  return(
    <div
    onDrop={handleDrop}
    onDragOver={e => e.preventDefault()}
    onClick={() => document.getElementById('fileInput')?.click()}
    className="dropInDiv"
    >
        <p>Drag & drop your CSV here—or click to select</p>
        <input
        id="fileInput"
        type="file"
        accept=".csv"
        style={{display: "none"}}
        onChange={handleSelect}
        />

    </div>
  );
}


