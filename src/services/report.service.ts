import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { Report } from "@/types";

const REPORTS_COLLECTION = "reports";
const reportsRef = collection(db, REPORTS_COLLECTION);

export const createReport = async (
  report: Omit<Report, "id" | "createdAt" | "status">
): Promise<void> => {
  await addDoc(reportsRef, {
    ...report,
    status: "pending",
    createdAt: Timestamp.now(),
  });
};

export const getAllReports = async (): Promise<Report[]> => {
  const q = query(reportsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
};

export const updateReportStatus = async (
  reportId: string,
  status: Report["status"]
): Promise<void> => {
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), { status });
};
