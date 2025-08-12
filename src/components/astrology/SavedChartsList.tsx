import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar, MapPin, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SavedChart {
  id: string;
  name: string;
  birth_date: string;
  city_name: string;
}

interface SavedChartsListProps {
  charts: SavedChart[];
  onView: (chartId: string) => void;
  onDelete: (chartId: string) => void;
  isLoading: boolean;
}

export function SavedChartsList({ charts, onView, onDelete, isLoading }: SavedChartsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Сохраненные карты</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : charts.length === 0 ? (
          <p className="text-muted-foreground text-center">У вас пока нет сохраненных карт.</p>
        ) : (
          <div className="space-y-4">
            {charts.map((chart) => (
              <div key={chart.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-semibold flex items-center"><User className="mr-2 h-4 w-4" />{chart.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> {format(new Date(chart.birth_date), "d MMMM yyyy 'г.'", { locale: ru })}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="mr-2 h-4 w-4" /> {chart.city_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onView(chart.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Смотреть
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя будет отменить. Карта для "{chart.name}" будет удалена навсегда.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(chart.id)}>
                          Да, удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}