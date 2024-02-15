import AddIcon from "../icons/addIcon"
import { useMemo, useState } from "react"
import Container from "./container"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import Task from "./task"

const defaultTasks = [
  {
    id: 1,
    columnId: 1,
    content: "List admin APIs for dashboard"
  },
  {
    id: 2,
    columnId: 1,
    content:
      "Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation"
  }
]

function Board({cards, setCards}) {
  const columnsId = useMemo(() => cards.map(col => col.id), [cards])

  const [tasks, setTasks] = useState(defaultTasks)

  const [activeColumn, setActiveColumn] = useState(null)

  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10
      }
    })
  )

  return (
    <div
      className="
        m-auto
        flex
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]
    "
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {cards.map(col => (
                <Container
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter(task => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
      onClick={() => {
        createNewColumn()
      }} className="flex
      gap-2"> 
          <AddIcon className="
      h-[60px]
      w-[60px]
      cursor-pointer
      hover:text-green-500
      "/></button> 
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <Container
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(task => task.columnId === activeColumn.id)}
              />
            )}
            {activeTask && (
              <Task
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  )
  function getNewCardId() {
    const ids = cards.map(obj => obj.id);
    return ids.length ? Math.max(...ids) + 1: 0
  }
  function createTask(columnId) {
    const newTask = {
      id: getNewCardId(),
      columnId,
      content: `Task ${tasks.length + 1}`
    }

    setTasks([...tasks, newTask])
  }

  function deleteTask(id) {
    const newTasks = tasks.filter(task => task.id !== id)
    setTasks(newTasks)
  }

  function updateTask(id, content) {
    const newTasks = tasks.map(task => {
      if (task.id !== id) return task
      return { ...task, content }
    })

    setTasks(newTasks)
  }

  function createNewColumn() {
    const columnToAdd = {
      id: getNewCardId(),
      title: `Column ${getNewCardId()}`
    }

    setCards([...cards, columnToAdd])
  }

  function deleteColumn(id) {
    const filteredColumns = cards.filter(col => col.id !== id)
    setCards(filteredColumns)

    const newTasks = tasks.filter(t => t.columnId !== id)
    setTasks(newTasks)
  }

  function updateColumn(id, title) {
    const newColumns = cards.map(col => {
      if (col.id !== id) return col
      return { ...col, title }
    })

    setCards(newColumns)
  }

  function onDragStart(event) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column)
      return
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task)
      return
    }
  }

  function onDragEnd(event) {
    setActiveColumn(null)
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveAColumn = active.data.current?.type === "Column"
    if (!isActiveAColumn) return

    console.log("DRAG END")

    setCards(columns => {
      const activeColumnIndex = columns.findIndex(col => col.id === activeId)

      const overColumnIndex = columns.findIndex(col => col.id === overId)

      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
  }

  function onDragOver(event) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === "Task"
    const isOverATask = over.data.current?.type === "Task"

    if (!isActiveATask) return

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId)
        const overIndex = tasks.findIndex(t => t.id === overId)

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          // Fix introduced after video recording
          tasks[activeIndex].columnId = tasks[overIndex].columnId
          return arrayMove(tasks, activeIndex, overIndex - 1)
        }

        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    const isOverAColumn = over.data.current?.type === "Column"

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId)

        tasks[activeIndex].columnId = overId
        console.log("DROPPING TASK OVER COLUMN", { activeIndex })
        return arrayMove(tasks, activeIndex, activeIndex)
      })
    }
  }
}

export default Board
