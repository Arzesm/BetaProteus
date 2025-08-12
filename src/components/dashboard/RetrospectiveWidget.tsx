import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Repeat, AlertTriangle, Sun } from "lucide-react";
import { Link } from "react-router-dom";

export function RetrospectiveWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Repeat className="mr-2 h-5 w-5 text-purple-500" />
          Циклы и ретроспектива
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0 mt-1 text-yellow-500" />
          <div>
            <p className="font-semibold">Напоминание о повторяющихся паттернах</p>
            <p className="text-sm text-muted-foreground">
              Похожий сон уже был 3 месяца назад – о поиске признания и уходе от публики.
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <Sun className="mr-3 h-5 w-5 flex-shrink-0 mt-1 text-orange-500" />
          <div>
            <p className="font-semibold">Астрологическая связь</p>
            <p className="text-sm text-muted-foreground">
              Сегодня Луна в тех же градусах, что и в{" "}
              <Link
                to="/journal#4"
                className="font-semibold text-primary underline underline-offset-4 transition-colors"
              >
                день важного события (12.04.2025)
              </Link>
              .
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}