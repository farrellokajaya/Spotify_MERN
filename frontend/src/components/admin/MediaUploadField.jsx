import { useRef, useState } from "react";

import { uploadMedia } from "../../utils/uploadMedia";
import { validateMediaFile } from "../../utils/validateMediaFile";
import "./MediaUploadField.css";

const MediaUploadField = ({
  label,
  type = "image",
  value,
  onChange,
  placeholder,
  helperText,
}) => {
  const inputFileRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const accept =
    type === "audio" ? ".mp3,.wav,.ogg,.m4a" : ".jpg,.jpeg,.png,.webp";

  const handleUrlChange = (event) => {
    onChange(event.target.value);
    setMessage("");
    setMessageType("");
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    setMessage("");
    setMessageType("");

    const validationMessage = validateMediaFile({ file, type });

    if (validationMessage) {
      setMessage(validationMessage);
      setMessageType("error");

      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }

      return;
    }

    try {
      setIsUploading(true);

      const uploadedUrl = await uploadMedia({ file, type });

      if (!uploadedUrl) {
        throw new Error("Upload berhasil, tetapi URL media tidak ditemukan.");
      }

      onChange(uploadedUrl);
      setMessage("Upload berhasil. URL sudah otomatis diisi.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Upload gagal. Silakan coba lagi.");
      setMessageType("error");
    } finally {
      setIsUploading(false);

      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
    }
  };

  return (
    <div className="media-upload-field">
      <label className="media-upload-label">{label}</label>

      <input
        type="url"
        value={value || ""}
        onChange={handleUrlChange}
        placeholder={placeholder || "Masukkan URL manual atau upload file"}
        className="media-upload-url-input"
      />

      <div className="media-upload-actions">
        <input
          ref={inputFileRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="media-upload-file-input"
        />

        {isUploading ? (
          <span className="media-upload-loading" aria-live="polite">
            Mengupload {type === "audio" ? "audio" : "image"}...
          </span>
        ) : null}
      </div>

      {helperText ? <p className="media-upload-helper">{helperText}</p> : null}

      {message ? (
        <p className={`media-upload-message ${messageType}`} role="status">
          {message}
        </p>
      ) : null}

      {type === "image" && value ? (
        <div className="media-upload-preview">
          <img src={value} alt={`${label} preview`} />
        </div>
      ) : null}

      {type === "audio" && value ? (
        <div className="media-upload-audio-preview">
          <audio controls src={value}>
            Browser tidak mendukung audio player.
          </audio>
        </div>
      ) : null}
    </div>
  );
};

export default MediaUploadField;