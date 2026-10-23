import {
  Button,
  Text,
  Card,
  CardPreview,
  CardHeader,
} from "@fluentui/react-components";
import { ClockRegular, Star24Regular } from "@fluentui/react-icons";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";

import { fadeIn, staggerContainer } from "./landingAnimations";
import { useStyles } from "./LandingPage.styles";

// Mock data for featured recipes
const featuredRecipes = [
  {
    id: 1,
    title: "Classic Chocolate Cake",
    time: "45 min",
    rating: 4.8,
    // image: "/images/chocolate-cake.jpg",
  },
  {
    id: 2,
    title: "Fresh Summer Salad",
    time: "15 min",
    rating: 4.5,
    // image: "/images/summer-salad.jpg",
  },
  {
    id: 3,
    title: "Homemade Pasta",
    time: "60 min",
    rating: 4.9,
    // image: "/images/homemade-pasta.jpg",
  },
];

export const FeaturedRecipes = () => {
  const styles = useStyles();
  const router = useRouter();
  return (
    <section className={styles.featuredSection}>
      <motion.h2
        className={styles.sectionTitle}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        Featured Recipes
      </motion.h2>

      <motion.div
        className={styles.recipesGrid}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {featuredRecipes.map((recipe) => (
          <motion.div key={recipe.id} variants={fadeIn}>
            <Card
              className={styles.recipeCard}
              onClick={() => router.push(`/recipes/${recipe.id}`)}
            >
              <CardPreview>
                <Image
                  src={""}
                  alt={recipe.title}
                  width={300}
                  height={200}
                  className={styles.cardImage}
                />
              </CardPreview>
              <CardHeader
                header={<Text weight="semibold">{recipe.title}</Text>}
                description={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <ClockRegular fontSize={14} />
                      {recipe.time}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Star24Regular fontSize={14} />
                      {recipe.rating}
                    </span>
                  </div>
                }
              />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        viewport={{ once: true }}
      >
        <Button
          className={styles.primaryButton}
          style={{ marginTop: "40px" }}
          onClick={() => router.push("/recipes")}
        >
          View All Recipes
        </Button>
      </motion.div>
    </section>
  );
};
