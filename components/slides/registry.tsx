import type { ComponentType } from "react";
import type { SceneMode } from "@/lib/scene";
import {
  ClosingSlide,
  CoverSlide,
  DatabaseSlide,
  DescriptionSlide,
  Dfd0Slide,
  Dfd1Slide,
  ErdSlide,
  NeedsSlide,
  ReportSlide,
  UsersSlide,
  WorkflowSlide,
  type SlideProps,
} from "./content";

export type SlideDef = {
  id: string;
  title: string;
  /** Short label for the overview grid. */
  section: string;
  scene: SceneMode;
  Component: ComponentType<SlideProps>;
};

/** The 11 slides, in presentation order. */
export const SLIDES: SlideDef[] = [
  { id: "cover", title: "Sistem Informasi Hotel", section: "Pembuka", scene: "hotel-cover", Component: CoverSlide },
  { id: "deskripsi", title: "Deskripsi Sistem", section: "Konteks", scene: "rings", Component: DescriptionSlide },
  { id: "kebutuhan", title: "Kebutuhan Utama", section: "Konteks", scene: "geometry", Component: NeedsSlide },
  { id: "pengguna", title: "Pengguna & Peran", section: "Konteks", scene: "rings-alt", Component: UsersSlide },
  { id: "dfd-0", title: "DFD Level 0", section: "Pemodelan", scene: "none", Component: Dfd0Slide },
  { id: "dfd-1", title: "DFD Level 1", section: "Pemodelan", scene: "none", Component: Dfd1Slide },
  { id: "erd", title: "ERD", section: "Pemodelan", scene: "none", Component: ErdSlide },
  { id: "database", title: "Rancangan Database", section: "Pemodelan", scene: "none", Component: DatabaseSlide },
  { id: "alur", title: "Alur Kerja", section: "Operasional", scene: "none", Component: WorkflowSlide },
  { id: "laporan", title: "Sistem Report", section: "Operasional", scene: "geometry", Component: ReportSlide },
  { id: "penutup", title: "Manfaat & Penutup", section: "Penutup", scene: "hotel-close", Component: ClosingSlide },
];
