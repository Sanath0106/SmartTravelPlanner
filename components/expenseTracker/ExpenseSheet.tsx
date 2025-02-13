"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { expenseCategories } from "@/lib/constants";
import UserDropdown from "@/components/expenseTracker/UserDropdown";
import { Doc } from "@/convex/_generated/dataModel";


const formSchema = z.object({
  purpose: z.string().min(2).max(50),
  category: z.enum(["commute", "food", "shopping", "gifts", "accomodations", "others"]),
  amount: z.coerce.number(),
  date: z.date(),
  userId: z.string(),
});

export default function ExpenseSheet({
  planId,
  data,
  edit,
}: {
  planId: string;
  edit?: boolean;
  data?: Doc<"expenses">;
}) {
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
    }
  });

  useEffect(() => {
    if (edit && data) {
      form.setValue("purpose", data.purpose);
      form.setValue("amount", data.amount);
      form.setValue("category", data.category);
      form.setValue("userId", data.userId);
      form.setValue("date", new Date(data.date));
    }
  }, [edit, data, form]);

  const addExpense = useMutation(api.expenses.createExpense);
  const updateExpense = useMutation(api.expenses.updateExpense);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) return;

    if (edit) {
      await updateExpense({
        id: data?._id!,
        amount: values.amount,
        category: values.category,
        purpose: values.purpose,
        date: values.date.toISOString(),
        userId: values.userId,
      });
    } else {
      await addExpense({
        planId: planId,
        userId: values.userId,
        amount: values.amount,
        category: values.category,
        purpose: values.purpose,
        date: values.date.toISOString(),
      });
    }
    form.reset();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {edit ? (
          <span className="hover:underline hover:underline-offset-2 text-blue-600 hover:font-medium cursor-pointer">
            {data?.purpose}
          </span>
        ) : (
          <Button
            size="sm"
            variant="default"
            className="bg-blue-500 hover:bg-blue-700 text-white"
          >
            Add a New Expense
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{edit ? "Edit Expense" : "Add Expense"}</SheetTitle>
          <SheetDescription>
            {edit ? "Edit" : "Add"} your expenses during the travel to efficiently track them at the end.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-5">
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>For</FormLabel>
                  <FormControl>
                    <Input placeholder="What purpose did you spend?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who Spent</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a User" />
                      </SelectTrigger>
                      <SelectContent>
                        <UserDropdown userId={user!.id} planId={planId} userName={""} />
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem value={category.key} key={category.key}>
                            <div className="flex gap-2 items-center">
                              {category.icon}
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount(₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. ₹1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>On</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-background" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="outline"
              className={cn("text-white hover:text-white", {
                "bg-teal-500 hover:bg-teal-700": edit,
                "bg-blue-500 hover:bg-blue-700": !edit,
              })}
            >
              {edit ? "Update" : "Add"} Expense
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
