import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarClock } from "lucide-react";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (date: string) => void;
}

export function ScheduleDialog({ open, onOpenChange, onSchedule }: ScheduleDialogProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleConfirm = () => {
    if (!date || !time) return;
    const isoString = new Date(`${date}T${time}`).toISOString();
    onSchedule(isoString);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="text-blue-500" />
            Agendar Publicação
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date" className="text-slate-400">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-950 border-slate-800 focus:border-blue-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="time" className="text-slate-400">Hora</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-slate-950 border-slate-800 focus:border-blue-500"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={(e) => { e.preventDefault(); onOpenChange(false); }} className="text-slate-400 hover:text-white">
            Cancelar
          </Button>
          <Button type="button" onClick={(e) => { e.preventDefault(); handleConfirm(); }} className="bg-blue-600 hover:bg-blue-500 text-white">
            Confirmar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
