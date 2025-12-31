import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="tabs/index"
        options={{ title: "Camera" }}
      />
    </Tabs>
  );
}
