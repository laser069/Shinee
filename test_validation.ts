
import { CreateHabitSchema } from './server/src/schemas/habit.schema';

const testPayload = {
  name: "Exercise",
  icon: "🏃",
  color: "#6366f1",
  frequencyType: "flexible",
  goalCount: 3
};

try {
  CreateHabitSchema.parse(testPayload);
  console.log("Validation passed!");
} catch (error) {
  console.error("Validation failed:", error.errors);
}
