import {
  Mail,
  Clock,
  PieChart,
  Shield,
  Users,
  Zap,
  RefreshCw,
  BarChart3,
  FileDown,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Quick Creation",
    description:
      "Create and send professional invoices in minutes with an intuitive editor.",
  },
  {
    icon: RefreshCw,
    title: "Recurring Invoices",
    description:
      "Automate repeat billing by scheduling invoice templates that generate and send on your defined cadence.",
  },
  {
    icon: Mail,
    title: "Automated Email Reminders",
    description:
      "Never chase payments again — automated reminder emails go out on your schedule.",
  },
  {
    icon: Users,
    title: "Client Management",
    description:
      "Organise clients with full contact details, multiple addresses, and complete invoice history.",
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    description:
      "Track revenue trends, outstanding balances, and payment patterns with exportable reports.",
  },
  {
    icon: PieChart,
    title: "Invoice Analytics",
    description:
      "Get insights into your cash flow and invoice performance with clear visual charts.",
  },
  {
    icon: FileDown,
    title: "PDF Generation",
    description:
      "Download polished PDF invoices instantly — perfect for sharing or your own records.",
  },
  {
    icon: Shield,
    title: "Secure Sharing",
    description:
      "Client-facing invoice links are signed so only the intended recipient can access them.",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description:
      "Track payment status and invoice activity in real-time with instant notifications.",
  },
];

const Features = () => {
  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">
          Everything you need to manage invoices
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Powerful features to help you create, automate, and track invoices
          efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <feature.icon className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
