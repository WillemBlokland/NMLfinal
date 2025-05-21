export async function checkUserRatingLimit(username: string): Promise<boolean> {
    try {
      const response = await fetch("http://127.0.0.1:5000/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          action: "get_interactions",
        }),
      });
  
      if (!response.ok) {
        console.error("Failed to fetch user interactions");
        return false;
      }
  
      const data = await response.json();
      const interactions = data.interactions || [];
  
      const ratingCount = interactions.filter(
        (interaction: any) => interaction.action === "rate_story"
      ).length;
  
      return ratingCount >= 5;
    } catch (err) {
      console.error("Error checking user rating limit:", err);
      return false;
    }
  }
  