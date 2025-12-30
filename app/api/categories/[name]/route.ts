import { NextResponse } from "next/server"
import { updateCategory, deleteCategory } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: { name: string } }) {
  try {
    const { name: newName } = await request.json()
    const oldName = params.name

    if (!newName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const category = await updateCategory(oldName, newName)
    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { name: string } }) {
  try {
    const name = params.name
    await deleteCategory(name)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
