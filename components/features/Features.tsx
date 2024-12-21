import { Mail, Clock, PieChart, Shield, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Mail,
    title: "Automated Email Reminders",
    description: "Never chase payments again with automated reminder emails",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Track payment status and invoice views in real-time",
  },
  {
    icon: PieChart,
    title: "Invoice Analytics",
    description: "Get insights into your payment patterns and cash flow",
  },
  {
    icon: Shield,
    title: "Secure Sharing",
    description: "Share invoices securely via email links",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Manage your client information and invoice history",
  },
  {
    icon: Zap,
    title: "Quick Creation",
    description: "Create and send professional invoices in minutes",
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
          Powerful features to help you create and manage invoices efficiently
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
