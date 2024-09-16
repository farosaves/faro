import { stringify } from "csv-stringify/browser/esm/sync"

const data = [
  { name: "John", age: 30, city: "New York" },
  { name: "Jane", age: 25, city: "San,Francisco" },
  { name: "Bob", age: 35, city: "Chicago" },
]

const csv = stringify(data, {
  header: true,
  columns: ["name", "age", "city"],
})

export const testCSV = () => console.log(csv)
