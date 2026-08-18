"use client";

import { Camera } from "lucide-react";
import { useId, useRef, type ChangeEvent } from "react";

type Props = {
  label?: string;
  hint?: string;
  fileName?: string;
  onPick: (file: File) => void;
};

export function FileAttachment({
  label = "Add a photo",
  hint = "Camera or gallery · JPG PNG · max 5MB",
  fileName,
  onPick,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onPick(file);
  };

  return (
    <div className="gg-file">
      <input
        id={id}
        ref={inputRef}
        className="gg-file__input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChange}
      />
      {fileName ? (
        <div className="gg-file__row">
          <span className="gg-file__type">IMG</span>
          <div>
            <p className="gg-file__name">{fileName}</p>
            <p className="gg-file__meta">Attached</p>
          </div>
        </div>
      ) : (
        <label className="gg-file__zone" htmlFor={id}>
          <span className="gg-file__icon">
            <Camera size={20} />
          </span>
          <strong className="gg-file__title">{label}</strong>
          <span className="gg-file__hint">{hint}</span>
        </label>
      )}
    </div>
  );
}
