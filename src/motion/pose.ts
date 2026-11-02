import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision';

export type Pose = NormalizedLandmark[];

export type PoseEngine = {
  detect: (video: HTMLVideoElement, timestampMs: number) => Pose[];
  close: () => void;
  delegate: string;
};

/**
 * MediaPipe Pose Landmarker (lite) — 모델과 WASM 을 public/ 에서 직접 서빙한다.
 * 카메라 영상은 브라우저 밖으로 나가지 않는다.
 */
export async function createPoseEngine(numPoses = 2): Promise<PoseEngine> {
  const base = import.meta.env.BASE_URL;
  const fileset = await FilesetResolver.forVisionTasks(`${base}wasm`);

  const build = (delegate: 'GPU' | 'CPU') =>
    PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: `${base}models/pose_landmarker_lite.task`,
        delegate,
      },
      runningMode: 'VIDEO',
      numPoses,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

  let delegate: 'GPU' | 'CPU' = 'GPU';
  let landmarker: PoseLandmarker;
  try {
    landmarker = await build('GPU');
  } catch {
    delegate = 'CPU';
    landmarker = await build('CPU');
  }

  return {
    delegate,
    detect: (video, timestampMs) => {
      const res = landmarker.detectForVideo(video, timestampMs);
      return (res.landmarks ?? []) as Pose[];
    },
    close: () => {
      try {
        landmarker.close();
      } catch {
        /* 이미 닫힘 */
      }
    },
  };
}
