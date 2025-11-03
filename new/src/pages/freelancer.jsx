import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FreelancerDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>This Month Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$3,250</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hours Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">46h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks">
              <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                <li>Implement chat typing indicator</li>
                <li>Refactor dashboard cards</li>
                <li>Fix responsive issues on mobile</li>
              </ul>
            </TabsContent>
            <TabsContent value="invoices">
              <p className="text-sm text-muted-foreground">2 invoices pending payment.</p>
            </TabsContent>
            <TabsContent value="reviews">
              <p className="text-sm text-muted-foreground">4.9 average rating across 18 reviews.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


