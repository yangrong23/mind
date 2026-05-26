import { redirect } from "next/navigation"

/** Join and sign-in share the same web flow */
export default function SignUpPage() {
  redirect("/sign-in")
}
