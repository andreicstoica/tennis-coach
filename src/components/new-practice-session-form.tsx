import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "./ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/server";
import { redirect } from "next/navigation";

const formSchema = z.object({
  focus: z.string().min(2, {
    message: "Give something real to focus on!",
  }),
});

export default function NewPracticeSessionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      focus: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    //console.log(values);
    const focus = values.focus;
    const newPracticeSession = await api.practiceSession.create({ focus });
    const id = newPracticeSession[0]!.id;
    if (id) {
      redirect(`/practice-session/${id}`);
    } else {
      throw new Error("New practice session was not made with proper ID.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What do you want to focus on today?</CardTitle>
        <CardDescription>
          Try to narrow down into one element of your game, like shot tolerance
          or backhands
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="focus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel />
                  <FormControl>
                    <Input placeholder="backhand" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter>
        <p>Next, we&apos;ll setup a practice session tailored to you!</p>
      </CardFooter>
    </Card>
  );
}
