import { Button } from "@fluentui/react-components";
import { ArrowRight24Regular } from "@fluentui/react-icons";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

import { useStyles } from "./LandingPage.styles";
import { sizing } from "../theme/sizingTokens";

export const LandingHero = () => {
  const styles = useStyles();
  const router = useRouter();
  return (
    <section className={styles.hero}>
      {/* Decorative animated elements */}
      <motion.div
        className={styles.floatingBubble}
        style={{
          top: "10%",
          left: "10%",
          width: "300px",
          height: sizing.decorationLarge,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className={styles.floatingBubble}
        style={{
          bottom: "15%",
          right: "10%",
          width: "200px",
          height: sizing.decorationSmall,
        }}
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className={styles.heroContent}>
        <motion.h1
          className={styles.heading}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Cook with Confidence, Create with Joy
        </motion.h1>

        <motion.p
          className={styles.subHeading}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Discover, save, and create delicious recipes from around the world.
          Your personal cookbook, reimagined for the digital age.
        </motion.p>

        <motion.div
          className={styles.buttonGroup}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button
            className={styles.primaryButton}
            onClick={() => router.push("/recipes")}
            icon={<ArrowRight24Regular />}
            iconPosition="after"
          >
            Browse Recipes
          </Button>
          <Button
            className={styles.secondaryButton}
            onClick={() => router.push("/newRecipe")}
          >
            Create Recipe
          </Button>
        </motion.div>

        <motion.div
          className={styles.heroImageContainer}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {/* Replace with your hero image */}
          {/* <Image
              src="/hero-image.jpg"
              alt="Delicious food display"
              fill
              style={{ objectFit: "cover", borderRadius: "16px" }}
              priority
            /> */}
        </motion.div>
      </div>
    </section>
  );
};
