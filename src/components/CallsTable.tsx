import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Call = {
  id: string;
  operatorName: string;
  clientName: string;
  companyName: string;
  duration: string;
  type: "inbound" | "outbound";
};

const mockCalls: Call[] = [
  {
    id: "1",
    operatorName: "John Doe",
    clientName: "Alice Smith",
    companyName: "Tech Corp",
    duration: "5:23",
    type: "inbound",
  },
  {
    id: "2",
    operatorName: "Jane Smith",
    clientName: "Bob Johnson",
    companyName: "Acme Inc",
    duration: "3:45",
    type: "outbound",
  },
];

export function CallsTable() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Operator</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockCalls.map((call) => (
            <TableRow key={call.id}>
              <TableCell>{call.operatorName}</TableCell>
              <TableCell>{call.clientName}</TableCell>
              <TableCell>{call.companyName}</TableCell>
              <TableCell>{call.duration}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    call.type === "inbound"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {call.type}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}