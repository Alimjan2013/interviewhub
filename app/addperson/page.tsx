import { AddPersonForm } from "@/components/add-person-form"

export default function AddPersonPage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold">Add New Interview Profile</h1>
        <AddPersonForm />
      </div>
    </div>
  )
}

