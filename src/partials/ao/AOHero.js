import React from "react";
import { Box, Button, Text } from "grommet";

import { FullWidthSection } from "../../components/MDXLayout/shortcodes";
import hero from "../../images/ao/hero.svg";

const AOHero = () => {
  return (
    <Box
      background="black"
      style={{
        backgroundImage: `url("${hero}")`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover"
      }}
    >
      <FullWidthSection margin={{ vertical: "xxxlarge" }}>
        <Box align="center" gap="large">
          <Box align="center" gap="medium">
            <Text size="40px" weight={500}>
              Borderless, Limitless Capital
            </Text>
            <Text size="24px" textAlign="center" color="">
              Centrifuge is a fully compliant bridge to
              <br />
              the billions of dollars locked in crypto.
            </Text>
          </Box>
          <Button primary label="Access Capital" />
        </Box>
      </FullWidthSection>
      <Box
        fill="horizontal"
        background="accent-1"
        pad={{
          vertical: "xsmall"
        }}
      >
        <Text textAlign="center">
          Real Estate, Shipping invoices, etc, Real Estate, Shipping invoices,
          etc, Real Estate, Shipping invoices, etc.
        </Text>
      </Box>
    </Box>
  );
};

export default AOHero;