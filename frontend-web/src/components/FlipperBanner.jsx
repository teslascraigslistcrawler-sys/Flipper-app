import React from "react";
import { motion } from "framer-motion";

const items = ["👟", "🎮", "🔧", "📷", "🧸", "🎸", "☕"];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const flipVariant = {
  initial: { rotateY: 0 },
  flipped: {
    rotateY: 180,
    transition: { duration: 0.5 },
  },
};

export default function FlipperBanner() {
  return (
    <div style={styles.wrapper}>
      {/* ITEMS */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={styles.row}
      >
        {items.map((item, i) => (
          <motion.div key={i} variants={itemVariant} style={styles.cardWrap}>
            <motion.div
              style={styles.card}
              initial="initial"
              animate="flipped"
              variants={flipVariant}
              transition={{ delay: 1 + i * 0.12 }}
            >
              {/* FRONT */}
              <div style={{ ...styles.face, ...styles.front }}>
                {item}
              </div>

              {/* BACK */}
              <div style={{ ...styles.face, ...styles.back }}>
                💲
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* LOGO */}
      <motion.h1
        style={styles.title}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, duration: 0.4 }}
      >
        FLIPPER
      </motion.h1>

      {/* TAGLINE */}
      <motion.p
        style={styles.tagline}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.4 }}
      >
        Scan. Price. Profit.
      </motion.p>

      {/* CTA */}
      <motion.button
        style={styles.button}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8 }}
      >
        Scan Item
      </motion.button>
    </div>
  );
}

const styles = {
  wrapper: {
    textAlign: "center",
    padding: "60px 20px",
    background: "linear-gradient(to bottom, #f8f9fa, #ffffff)",
  },
  row: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "30px",
    perspective: 1000,
  },
  cardWrap: {
    width: 60,
    height: 60,
  },
  card: {
    width: "100%",
    height: "100%",
    position: "relative",
    transformStyle: "preserve-3d",
  },
  face: {
    position: "absolute",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    borderRadius: "12px",
    backfaceVisibility: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  front: {
    background: "#ffffff",
  },
  back: {
    background: "#d4edda",
    transform: "rotateY(180deg)",
  },
  title: {
    fontSize: "42px",
    fontWeight: "700",
    margin: "10px 0",
    letterSpacing: "2px",
  },
  tagline: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "20px",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    background: "#28a745",
    color: "#fff",
    cursor: "pointer",
  },
};
