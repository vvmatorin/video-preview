export interface Video {
  id: string;
  name: string;
  path: string;
}

export interface Experiment {
  id: string;
  name: string;
  dirPath: string;
  videos: Video[];
}
