import { LanguageWrapper, HomePage } from "../App_Logic_Export"; // I'll need to export these from root.tsx or a helper

export default function HomeRoute() {
  return (
    <LanguageWrapper>
      <HomePage />
    </LanguageWrapper>
  );
}
