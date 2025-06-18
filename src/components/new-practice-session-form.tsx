"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

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
import { Loader2 } from "lucide-react";
import { LettersPullUp } from "~/components/letters-pull-up";

const formSchema = z.object({
  focus: z.string().min(2, {
    message: "Give something real to focus on!",
  }),
});

export default function NewPracticeSessionForm({
  ref,
}: {
  ref: React.ForwardedRef<HTMLDivElement>;
}) {
  const router = useRouter();
  const createPracticeSession = api.practiceSession.create.useMutation({
    onSuccess: (data) => {
      console.log(data);
      const id = data[0]?.id;
      if (id) {
        router.push(`/practice-session/${id}`);
      }
    },
    onError: (error) => {
      console.error("failed to create session:", error);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      focus: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const focus = values.focus;
    console.log("form submit, creating practice session");
    createPracticeSession.mutate({ focus });
  }

  return (
    <Card ref={ref}>
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
                    <Input placeholder="My backhand... :(" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="mt-3"
              type="submit"
              disabled={
                createPracticeSession.isPending ||
                createPracticeSession.isPaused
              }
            >
              {createPracticeSession.isPending ||
              createPracticeSession.isPaused ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  <LettersPullUp
                    text={"Coach is thinking"}
                    className="text-xs"
                  />
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col items-start">
        <>Next, we&apos;ll setup a practice session tailored to you!</>
      </CardFooter>
    </Card>
  );
}
