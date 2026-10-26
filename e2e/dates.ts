// Date d'événement au format AAAA-MM-JJ, décalée de `daysAhead` jours.
// Les dates en dur expirent (la validation exige une date future) : les
// specs calculent donc leurs dates relativement au jour d'exécution.
export const futureDate = (daysAhead: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};
