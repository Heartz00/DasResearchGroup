// Presentation aliases only; WordPress roles and member records stay intact.
export function peopleRole(role: string) {
  return (
    (
      {
        'Graduate Students': 'Graduate Researchers',
        'Postdoctoral Fellows': 'Postdoctoral Researchers',
        'Undergraduate Students': 'Undergraduate Researchers',
      } as Record<string, string>
    )[role] || role
  );
}
