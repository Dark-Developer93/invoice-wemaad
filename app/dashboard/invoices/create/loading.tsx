import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function LoadingFormCreation() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        {/* Invoice Name and Badge Section */}
        <div className="flex flex-col gap-1 w-fit mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-16" /> {/* Badge */}
            <Skeleton className="h-10 w-48" /> {/* Invoice Name Input */}
          </div>
        </div>

        {/* Invoice Number and Currency Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Invoice Number Input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-20" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Currency Select */}
          </div>
        </div>

        {/* From/To Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* From Section */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-12" /> {/* Label */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" /> {/* Name */}
              <Skeleton className="h-10 w-full" /> {/* Email */}
              <Skeleton className="h-10 w-full" /> {/* Address */}
            </div>
          </div>

          {/* To Section */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-8" /> {/* Label */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" /> {/* Client Name */}
              <Skeleton className="h-10 w-full" /> {/* Client Email */}
              <Skeleton className="h-10 w-full" /> {/* Client Address */}
            </div>
          </div>
        </div>

        {/* Date and Due Date Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-12" /> {/* Label */}
            <Skeleton className="h-10 w-[280px]" /> {/* Date Button */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Due Date Select */}
          </div>
        </div>

        {/* Invoice Items Section */}
        <div className="space-y-4 mb-6">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="h-5 col-span-6" /> {/* Description */}
            <Skeleton className="h-5 col-span-2" /> {/* Quantity */}
            <Skeleton className="h-5 col-span-2" /> {/* Rate */}
            <Skeleton className="h-5 col-span-2" /> {/* Amount */}
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <Skeleton className="h-24 w-full" /> {/* Description Textarea */}
            </div>
            <div className="col-span-2">
              <Skeleton className="h-10 w-full" /> {/* Quantity Input */}
            </div>
            <div className="col-span-2">
              <Skeleton className="h-10 w-full" /> {/* Rate Input */}
            </div>
            <div className="col-span-2">
              <Skeleton className="h-10 w-full" /> {/* Amount Input */}
            </div>
          </div>
        </div>

        {/* Total Section */}
        <div className="flex justify-end mb-6">
          <div className="w-1/3 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex justify-between pt-2 border-t">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-2 mb-6">
          <Skeleton className="h-5 w-12" /> {/* Label */}
          <Skeleton className="h-24 w-full" /> {/* Textarea */}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
      </CardContent>
    </Card>
  );
}
