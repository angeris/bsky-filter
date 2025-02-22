import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as cliProgress from 'cli-progress';

async function runClassification(useModel, classificationModel, texts) { 
  const embeddings = await useModel.embed(texts);
  const predictions = classificationModel.predict(embeddings);

  console.log(`Predictions:`);
  predictions.print();
}

async function trainClassificationModel(useModel, classificationModel, texts, labels, epochs = 10) {
  // 1. Get embeddings for the input texts using the USE model.
  const embeddings = await useModel.embed(texts);

  const progressBar = new cliProgress.SingleBar({
    format: 'Training Progress | {bar} | {percentage}% | Accuracy: {accuracy}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  // 2. Compile the classificationModel for training.
  classificationModel.compile({
    optimizer: 'adam', // Common optimizer
    loss: 'sparseCategoricalCrossentropy', // Suitable for multi-class classification with integer labels
    metrics: ['accuracy'] // To track accuracy during training
  });

  function onEpochEnd(epoch, logs) {
    progressBar.update(epoch+1, { accuracy: logs.acc });
  }
  progressBar.start(epochs, 0, {
    accuracy: 0
  });

  // 3. Train the classificationModel using the embeddings and labels.
  await classificationModel.fit(embeddings, tf.tensor1d(labels, 'float32'), { // labels should be a 1D tensor of integers
    epochs: epochs,
    callbacks: {onEpochEnd},
  });
  progressBar.stop();

  console.log('Training finished.');
}

console.log('Loading Universal Sentence Encoder (USE) model...');
const useModel = await use.load();
console.log('USE model loaded');

const trainingTexts = [
  "This is great!",
  "I love this.",
  "This is terrible.",
  "I hate it.",
  "It's okay.",
  "Not bad.",
  "This is awful!",
  "Fantastic!",
  "Meh",
  "It's ok at best",
  "it's really very good",
  "it's really not very good"
];
const trainingLabels = [1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0]; // 1 for positive, 0 for negative (example binary labels)

// Define the classification model outside of runClassification
const classificationModel = tf.sequential();

// Add a dense layer. Assume USE embeddings have dimension 512.
classificationModel.add(tf.layers.dense({
  units: 128,
  activation: 'relu',
  inputShape: [512] // Assuming USE embedding dimension is 512
}));

// Add a softmax layer with 2 outputs
classificationModel.add(tf.layers.dense({
  units: 2,
  activation: 'softmax'
}));

console.log('Starting Classification Model Training...');
await trainClassificationModel(useModel, classificationModel, trainingTexts, trainingLabels, 20); // Train for 20 epochs
console.log('Classification Model Trained!');

await runClassification(useModel, classificationModel, ["ok you'd think this would be good but it's just not"])