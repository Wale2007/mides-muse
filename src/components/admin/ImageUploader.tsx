import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import './ImageUploader.css';

interface Props {
  images: string[];
  onImagesChange: (urls: string[]) => void;
}

const ImageUploader = ({ images, onImagesChange }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const urls: string[] = [...images];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        urls.push(data.publicUrl);
      }

      onImagesChange(urls);
    } catch (err) {
      console.error('Upload failed:', err);
    }

    setUploading(false);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="image-uploader">
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files); }}
      >
        <FiUploadCloud size={36} className="upload-icon" />
        <p className="upload-text">
          {uploading ? 'Uploading...' : 'Drag & drop or click to upload'}
        </p>
        <span className="upload-hint">PNG, JPG up to 5MB</span>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="image-previews">
          {images.map((url, i) => (
            <div key={i} className="preview-thumb">
              <img src={url} alt={`Preview ${i + 1}`} />
              <button
                onClick={() => removeImage(i)}
                className="remove-btn"
                aria-label="Remove image"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
