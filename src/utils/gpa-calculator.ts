type GpaCourse = {
  type: "PLAN" | "ACTUAL";
  credit: number;
  grade_point: number;
};

export const calculateSemesterMetrics = (courses: GpaCourse[]) => {
  const actual = courses.filter((course) => course.type === "ACTUAL");
  const sum = (items: GpaCourse[]) => ({
    credits: items.reduce((total, course) => total + course.credit, 0),
    points: items.reduce(
      (total, course) => total + course.grade_point * course.credit,
      0,
    ),
  });
  const actualTotals = sum(actual);
  const projectedTotals = sum(courses);
  const rounded = (value: number) => Number(value.toFixed(2));

  return {
    actualCredits: actualTotals.credits,
    actualPoints: actualTotals.points,
    actualGpa: actualTotals.credits
      ? rounded(actualTotals.points / actualTotals.credits)
      : 0,
    projectedCredits: projectedTotals.credits,
    projectedPoints: projectedTotals.points,
    projectedGpa: projectedTotals.credits
      ? rounded(projectedTotals.points / projectedTotals.credits)
      : 0,
  };
};
