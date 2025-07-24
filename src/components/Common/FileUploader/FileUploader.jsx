import React, {
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";
import styles from "./FileUploader.module.css";
import { apiService } from "../../../services/apiService";
import { useNavigate } from "react-router-dom";

const FileUploader = forwardRef(({ onFileChange, defaultFileName }, ref) => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setUploadError("");
        setUploadSuccess(false);
        if (onFileChange) onFileChange(e.target.files[0]);
    };

    const upload = async () => {
        if (!selectedFile) {
            setUploadError("Please select a file to upload.");
            return;
        }
        setUploading(true);
        setUploadError("");
        setUploadSuccess(false);
        try {
            const result = await apiService.uploadFile(selectedFile);
            setUploadSuccess(true);
            setSelectedFile(null);
            fileInputRef.current.value = "";
        } catch (err) {
            setUploadError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        upload,
        getSelectedFile: () => selectedFile,
        clear: () => {
            setSelectedFile(null);
            setUploadError("");
            setUploadSuccess(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
    }));

    return (
        <div className={styles.uploaderContainer}>
            <input
                type="file"
                ref={fileInputRef}
                className={styles.hiddenFileInput}
                onChange={handleFileChange}
                disabled={uploading}
                tabIndex={-1}
                style={{ display: "none" }}
            />
            <div
                className={styles.customFileInput}
                onClick={() => {
                    if (!uploading && fileInputRef.current)
                        fileInputRef.current.click();
                }}
                tabIndex={0}
                role="button"
                aria-disabled={uploading}
            >
                <div className={styles.innerTextHolder}>
                    <span className={styles.customFileInputInner}>
                        {selectedFile ? selectedFile.name : defaultFileName}
                    </span>
                </div>
            </div>
        </div>
    );
});

export default FileUploader;
