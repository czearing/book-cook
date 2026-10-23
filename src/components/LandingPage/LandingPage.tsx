import * as React from "react";
import { Button } from "@fluentui/react-components";
import {
  SparkleRegular,
  ClockRegular,
  CollectionsRegular,
} from "@fluentui/react-icons";
import { motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";

import { FeaturedRecipes } from "./FeaturedRecipes";
import { fadeIn, staggerContainer } from "./landingAnimations";
import { LandingHero } from "./LandingHero";
import { useStyles } from "./LandingPage.styles";

const LandingPage = () => {
  const styles = useStyles();
  const { data: session } = useSession();

  return (
    <div className={styles.container}>
      <LandingHero />

      <FeaturedRecipes />

      {/* Features Section */}
      {!session && (
        <>
          <section className={styles.featuresSection}>
            <motion.h2
              className={styles.sectionTitle}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              Why Choose Book Cook
            </motion.h2>

            <motion.div
              className={styles.featuresGrid}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.div className={styles.featureItem} variants={fadeIn}>
                <div className={styles.featureIcon}>
                  <SparkleRegular />
                </div>
                <h3 className={styles.featureTitle}>Smart Recommendations</h3>
                <p className={styles.featureDesc}>
                  Discover new recipes tailored to your taste preferences and
                  cooking history.
                </p>
              </motion.div>

              <motion.div className={styles.featureItem} variants={fadeIn}>
                <div className={styles.featureIcon}>
                  <CollectionsRegular />
                </div>
                <h3 className={styles.featureTitle}>Organized Collections</h3>
                <p className={styles.featureDesc}>
                  Create custom collections to organize your favorite recipes by
                  occasion, cuisine, or diet.
                </p>
              </motion.div>

              <motion.div className={styles.featureItem} variants={fadeIn}>
                <div className={styles.featureIcon}>
                  <ClockRegular />
                </div>
                <h3 className={styles.featureTitle}>Time-Saving Tools</h3>
                <p className={styles.featureDesc}>
                  Meal planning and shopping lists all in one place to
                  streamline your cooking.
                </p>
              </motion.div>
            </motion.div>
          </section>
          <motion.section
            className={styles.ctaSection}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.ctaTitle}>
              Ready to Start Your Culinary Journey?
            </h2>
            <p className={styles.ctaDesc}>
              Join others in creating and sharing amazing recipes every day.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className={styles.ctaButton}
                onClick={() => signIn("google")}
              >
                Sign up
              </Button>
            </motion.div>
          </motion.section>
        </>
      )}
    </div>
  );
};

export default LandingPage;
