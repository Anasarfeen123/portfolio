import { projects } from "@/data/portfolio";

/** World placement only: all visitor-facing project facts remain in projects.json. */
export const shoresExhibitProject = projects.find((project) => project.id === "rover") ?? projects[0];
