"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Upload, X, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface FileUploadProps {
  value?: Array<{ name: string; id: string; type: string }>
  onChange?: (value: Array<{ name: string; id: string; type: string }>) => void
}

interface UploadedFile {
  name: string
  originalName: string
  id: string
  progress: number
  error?: string
  isEditing?: boolean
  type: string
}

const MAX_FILES = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

export function FileUpload({ value = [], onChange }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (value.length > 0 && uploadedFiles.length === 0) {
      const initialFiles = value.map((file) => ({
        name: file.name,
        originalName: file.name,
        id: file.id,
        progress: 100,
        type: file.type,
      }))
      setUploadedFiles(initialFiles)
    }
  }, [value, uploadedFiles.length])

  const updateParentForm = useCallback(
    (files: UploadedFile[]) => {
      const fileData = files
        .filter((f) => f.id)
        .map((f) => ({
          name: f.name,
          id: f.id,
          type: f.type,
        }))
      onChange?.(fileData)
    },
    [onChange],
  )

  const uploadFile = async (file: File): Promise<string> => {
    // Add timestamp to filename while preserving extension
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const timestampedFileName = `${file.name.replace(`.${extension}`, "")}_${timestamp}.${extension}`

    const formData = new FormData()
    // Use timestamped filename for actual upload
    const timestampedFile = new File([file], timestampedFileName, { type: file.type })
    formData.append("file", timestampedFile)

    const response = await fetch("https://api.elevenlabs.io/v1/convai/knowledge-base", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Upload failed with status ${response.status}`)
    }

    const data = await response.json()
    console.log("Upload response:", data)

    if (!data.id) {
      throw new Error("No file ID received from server")
    }

    return data.id
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setError("")

    if (uploadedFiles.length + files.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files`)
      return
    }

    for (const file of files) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed")
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Files must be less than 5MB")
        continue
      }

      // Keep original name for display
      const displayName = file.name

      const newFile: UploadedFile = {
        name: displayName, // This is what user sees
        originalName: displayName,
        id: "",
        progress: 0,
        type: "file",
      }

      setUploadedFiles((prev) => [...prev, newFile])

      try {
        const fileId = await uploadFile(file)

        setUploadedFiles((prev) => {
          const updated = prev.map((f) => (f.originalName === displayName ? { ...f, id: fileId, progress: 100 } : f))
          updateParentForm(updated)
          return updated
        })
      } catch (error) {
        console.error("Upload error:", error)
        const errorMessage = error instanceof Error ? error.message : "Failed to upload file"
        setUploadedFiles((prev) =>
          prev.map((f) => (f.originalName === displayName ? { ...f, error: errorMessage, progress: 0 } : f)),
        )
        setError(errorMessage)
      }
    }

    event.target.value = ""
  }

  const removeFile = useCallback(
    (originalName: string) => {
      setUploadedFiles((prev) => {
        const updated = prev.filter((f) => f.originalName !== originalName)
        updateParentForm(updated)
        return updated
      })
    },
    [updateParentForm],
  )

  const startEditing = useCallback((originalName: string) => {
    setUploadedFiles((prev) => prev.map((f) => (f.originalName === originalName ? { ...f, isEditing: true } : f)))
  }, [])

  const handleNameChange = useCallback(
    (originalName: string, newName: string) => {
      setUploadedFiles((prev) => {
        const updated = prev.map((f) =>
          f.originalName === originalName ? { ...f, name: newName, isEditing: false } : f,
        )
        updateParentForm(updated)
        return updated
      })
    },
    [updateParentForm],
  )

  return (
    <FormControl>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {uploadedFiles.map((file) => (
            <div key={file.originalName} className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  {file.isEditing ? (
                    <Input
                      className="max-w-[200px]"
                      defaultValue={file.name}
                      onBlur={(e) => handleNameChange(file.originalName, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleNameChange(file.originalName, e.currentTarget.value)
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{file.name}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(file.originalName)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removeFile(file.originalName)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Progress value={file.progress} className="h-2" />
                {file.error && <p className="text-sm text-red-500">{file.error}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <label
            htmlFor="file-upload"
            className={`flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-8 ${
              uploadedFiles.length >= MAX_FILES ? "opacity-50" : ""
            }`}
          >
            <Upload className="h-6 w-6" />
            <span>Upload PDF files (max {MAX_FILES} files, 5MB each)</span>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              disabled={uploadedFiles.length >= MAX_FILES}
            />
          </label>
        </div>
      </div>
    </FormControl>
  )
}

