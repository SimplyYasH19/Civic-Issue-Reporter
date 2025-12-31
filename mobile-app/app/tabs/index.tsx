import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import * as Location from "expo-location";
import { sendImageToAI } from "../../api/aiService";
import { updateDoc } from "firebase/firestore";
import { uploadIssueImage } from "../../firebase/storage";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

const MIN_CONFIDENCE = 60;

type AIResult = {
  issue_type: string;
  confidence: number;
};


export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [readyToConfirm, setReadyToConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Camera Access Required</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  /* ===== CAMERA VIEW ===== */

  if (showCamera) {
    return (
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={async () => {
              if (!cameraRef.current) return;

              setLoading(true);

              try {
                // 📷 Capture image
                const photo = await cameraRef.current.takePictureAsync({
                  quality: 0.7,
                });

                setShowCamera(false);
                setPhotoUri(photo.uri);

                // 📍 Location
                const { status } =
                  await Location.requestForegroundPermissionsAsync();

                if (status === "granted") {
                  const loc = await Location.getCurrentPositionAsync({});
                  setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                  });
                } else {
                  alert("Location permission is required to report an issue.");
                  setLoading(false);
                  return;
                }

                // 🤖 AI inference
                const aiResult = (await sendImageToAI(photo.uri)) as AIResult;

                const confidencePct = aiResult.confidence * 100;

                if (confidencePct < MIN_CONFIDENCE) {
                  alert(
                    "Uncertain detection. Please retake the image for better accuracy."
                  );

                  setResult(null);
                  setPhotoUri(null);
                  setLocation(null);
                  setReadyToConfirm(false);
                  return;
                }

                setResult({
                  issue_type: aiResult.issue_type,
                  confidence: confidencePct,
                });

                setReadyToConfirm(true);

              } catch (e) {
                console.error(e);
                alert("AI analysis failed");
              } finally {
                setLoading(false);
              }
            }}
          />
        </View>
      </CameraView>
    );
  }

  /* ===== HOME UI ===== */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Civic Issue Reporter</Text>
      <Text style={styles.subtitle}>
        AI-powered detection of civic problems
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setShowCamera(true)}
      >
        <Text style={styles.primaryButtonText}>Scan Civic Issue</Text>
      </TouchableOpacity>

      {photoUri && (
        <Image source={{ uri: photoUri }} style={styles.image} />
      )}

      {loading && (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      )}

      {result && readyToConfirm && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            Issue: {result.issue_type}
          </Text>
          <Text style={styles.resultText}>
            Confidence: {result.confidence.toFixed(2)}%
          </Text>

          
          {location && (
            <Text style={styles.resultText}>
              Location: {location.latitude.toFixed(5)},{" "}
              {location.longitude.toFixed(5)}
            </Text>
          )}

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={async () => {
              try {
                const docRef = await addDoc(collection(db, "issues"), {
                  issue_type: result.issue_type,
                  confidence: result.confidence,
                  latitude: location?.latitude ?? null,
                  longitude: location?.longitude ?? null,
                  status: "Pending",
                  source: "mobile_app",
                  deviceTime: new Date().toISOString(),
                  createdAt: serverTimestamp(),
                });

                const imageUrl = await uploadIssueImage(photoUri!, docRef.id);

                await updateDoc(docRef, {
                  image_url: imageUrl,
                });


                setSuccess(true);

                setTimeout(() => {
                  setSuccess(false);
                  setResult(null);
                  setPhotoUri(null);
                  setLocation(null);
                  setReadyToConfirm(false);
                }, 2000);
              } catch (e) {
                console.error(e);
                alert("Failed to report issue");
              }
            }}
          >
            <Text style={styles.confirmText}>Confirm Issue</Text>
          </TouchableOpacity>
        </View>
      )}

      {success && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            Issue Reported Successfully
          </Text>
        </View>
      )}
    </View>
  );
}

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#555",
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 220,
    marginTop: 20,
    borderRadius: 12,
  },
  resultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
  },
  resultText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  captureContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    borderWidth: 6,
    borderColor: "#2563eb",
  },
  confirmButton: {
    marginTop: 16,
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 10,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  successBox: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#dcfce7",
    borderRadius: 12,
  },
  successText: {
    color: "#166534",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
