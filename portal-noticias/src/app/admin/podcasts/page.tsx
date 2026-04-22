import { Mic2 } from "lucide-react";
import PodcastsClient from "@/components/admin/podcasts/PodcastsClient";

export default function PodcastsPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Mic2 size={20} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Podcasts & Biblioteca VOD</h1>
          <p className="text-sm text-slate-400">Gerencie episódios, thumbnails e reordene com drag-and-drop.</p>
        </div>
      </div>

      <PodcastsClient />
    </div>
  );
}
