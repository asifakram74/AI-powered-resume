import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";

export function useFaceDetection() {
  const [modelsLoaded, setModelsLoaded] = useState<boolean>(false);
  const [faceDetected, setFaceDetected] = useState<boolean | null>(null);
  const [faceScore, setFaceScore] = useState<number | null>(null);
  const [detectionErrorMessage, setDetectionErrorMessage] = useState<string | null>(null);

  // Load face-api models on mount (local fallback to CDN)
  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      const LOCAL_URL = "/models/face_detection";
      const CDN_URL = "https://justadudewhohacks.github.io/face-api.js/models";
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_URL);
        if (isMounted) setModelsLoaded(true);
      } catch (err) {
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(CDN_URL);
          if (isMounted) setModelsLoaded(true);
        } catch (err2) {
          console.error("Failed to load face-api models:", err2);
          if (isMounted) setModelsLoaded(false);
        }
      }
    };
    loadModels();
    return () => {
      isMounted = false;
    };
  }, []);

  // Utility to run detection on a base64 image (data URL)
  const runFaceDetection = async (dataUrl: string): Promise<boolean> => {
    setFaceDetected(null);
    setFaceScore(null);
    setDetectionErrorMessage(null);

    const img = document.createElement("img");
    img.src = dataUrl;

    return new Promise((resolve) => {
      img.onload = async () => {
        try {
          if (!modelsLoaded) {
            setFaceDetected(null);
            setDetectionErrorMessage("Face detection models are still loading. Please try again.");
            resolve(false);
            return;
          }

          const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
          });

          const detections = await faceapi.detectAllFaces(img, options);

          if (!detections || detections.length === 0) {
            setFaceDetected(false);
            setDetectionErrorMessage("No face detected in the image.");
            resolve(false);
            return;
          }

          // If multiple faces, pick the largest
          let best = detections[0];
          let bestArea = best.box.width * best.box.height;
          for (let i = 1; i < detections.length; i++) {
            const d = detections[i];
            const area = d.box.width * d.box.height;
            if (area > bestArea) {
              best = d;
              bestArea = area;
            }
          }

          const score = best.score ?? 0;
          setFaceScore(score);
          const faceBox = best.box;
          const imgArea = img.width * img.height;
          const faceArea = faceBox.width * faceBox.height;
          const faceRatio = faceArea / imgArea;

          const minScore = 0.45;
          const minFaceRatio = 0.005; // ~0.5% of image area

          if (score < minScore || faceRatio < minFaceRatio) {
            setFaceDetected(false);
            setDetectionErrorMessage("Face too small or low confidence. Please upload a clearer photo.");
            resolve(false);
            return;
          }

          setFaceDetected(true);
          setDetectionErrorMessage(null);
          resolve(true);
        } catch (err) {
          console.error("Face detection error", err);
          setFaceDetected(false);
          setDetectionErrorMessage("Face detection failed. Please try another image.");
          resolve(false);
        }
      };

      img.onerror = () => {
        setFaceDetected(false);
        setDetectionErrorMessage("Could not read the image.");
        resolve(false);
      };
    });
  };

  return { modelsLoaded, faceDetected, faceScore, detectionErrorMessage, runFaceDetection };
}

export default useFaceDetection;