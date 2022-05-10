import React from 'react';

import {
  Layout,
  Page,
  Card,
  List,
  InContextLearning,
  InContextLearningContextProvider,
  Stack,
} from '../src';

import styles from './Learner.scss';

function StepOne() {
  return <span>Step 1: Testing React</span>;
}

function StepTwo() {
  return <span>Step 2: Testing React</span>;
}

function StepThree() {
  return <span>Step 3: Testing React</span>;
}

function LearnerApp() {
  return (
    <div className={styles.Root}>
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <InContextLearning onDismiss={() => {}} />
            <Card
              title="Shipment 1234"
              secondaryFooterActions={[
                {content: 'Cancel shipment', destructive: true},
              ]}
              primaryFooterAction={{content: 'Add tracking number'}}
            >
              <Card.Section title="Items">
                <List>
                  <List.Item>
                    <InContextLearning.Step stepIndex={0}>
                      <span>1 × Oasis Glass, 4-Pack</span>
                      <p>FOOOOOO</p>
                    </InContextLearning.Step>
                  </List.Item>
                  <List.Item>1 × Anubis Cup, 2-Pack</List.Item>
                </List>
              </Card.Section>
            </Card>
            <Card>
              <Card.Section title="Collections">
                <InContextLearning.Step stepIndex={1}>
                  <span>another piece of content</span>
                </InContextLearning.Step>
              </Card.Section>
              <Card.Section title="Tags" />
            </Card>

            <Stack distribution="trailing">
              <InContextLearning.Step stepIndex={2}>
                <span data-learning-step-three>
                  Yet another piece of content!
                </span>
              </InContextLearning.Step>
            </Stack>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}

export function Learner() {
  return (
    <InContextLearningContextProvider
      stepComponents={[StepOne, StepTwo, StepThree]}
    >
      <LearnerApp />
    </InContextLearningContextProvider>
  );
}
