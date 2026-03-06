import { useState, type ChangeEvent, useCallback } from 'react';
import type { UseFormSetValue, FieldValues, Path, PathValue } from 'react-hook-form';

export const useImageUpload = <T extends FieldValues>(setValue: UseFormSetValue<T>, fieldName: Path<T>) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setValue(fieldName, file as PathValue<T, Path<T>>, { shouldValidate: true });

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [setValue, fieldName],
  );

  const removeImage = useCallback(() => {
    setPreview(null);
    setValue(fieldName, undefined as PathValue<T, Path<T>>, { shouldValidate: true });
  }, [setValue, fieldName]);

  return { preview, handleImageChange, removeImage, setPreview };
};
