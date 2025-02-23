import * as tf from "@tensorflow/tfjs";
import * as use from "@tensorflow-models/universal-sentence-encoder";

export async function trainModel(trainingTexts, trainingLabels) {
  console.log("Loading Universal Sentence Encoder (USE) model...");
  const useModel = await use.load();
  console.log("USE model loaded");

  // Filter out undefined/null values from texts and labels
  const validData = trainingTexts
    .map((text, index) => ({ text, label: trainingLabels[index] }))
    .filter(
      (item) =>
        item.text !== undefined &&
        item.text !== null &&
        item.label !== undefined &&
        item.label !== null
    );

  // Extract clean texts and labels
  const filteredTexts = validData.map((item) => item.text);
  const filteredLabels = validData.map((item) => item.label);

  console.log("Filtered Training Data:", filteredTexts, filteredLabels);

  const classificationModel = tf.sequential();
  classificationModel.add(
    tf.layers.dense({ units: 128, activation: "relu", inputShape: [512] })
  );
  classificationModel.add(tf.layers.dense({ units: 2, activation: "softmax" }));

  console.log("Starting Classification Model Training...");
  await trainClassificationModel(
    useModel,
    classificationModel,
    filteredTexts,
    filteredLabels,
    20
  );
  console.log("Classification Model Trained!");

  // Run classification on a sample input
  await runClassification(useModel, classificationModel, [
    "ok you'd think this would be good but it's just not",
  ]);
}

async function trainClassificationModel(
  useModel,
  classificationModel,
  texts,
  labels,
  epochs = 10
) {
  if (texts.length === 0 || labels.length === 0) {
    console.log("No valid training data. Skipping training.");
    return;
  }

  const embeddings = await useModel.embed(texts);

  classificationModel.compile({
    optimizer: "adam",
    loss: "sparseCategoricalCrossentropy",
    metrics: ["accuracy"],
  });

  console.log("Training Started...");

  await classificationModel.fit(embeddings, tf.tensor1d(labels, "float32"), {
    epochs: epochs,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: Accuracy = ${logs.acc}`);
      },
    },
  });

  console.log("Training Finished.");
}

async function runClassification(useModel, classificationModel, texts) {
  const filteredTexts = texts.filter(
    (text) => text !== undefined && text !== null
  );
  if (filteredTexts.length === 0) {
    console.log("No valid text for classification.");
    return;
  }

  const embeddings = await useModel.embed(filteredTexts);
  const predictions = classificationModel.predict(embeddings);
  console.log(`Predictions:`);
  predictions.print();
}

async function classify(useModel, classificationModel, texts) {
  const filteredTexts = texts.filter(
    (text) => text !== undefined && text !== null
  );
  if (filteredTexts.length === 0) {
    console.log("No valid text for classification.");
    return;
  }

  const embeddings = await useModel.embed(filteredTexts);
  const predictions = classificationModel.predict(embeddings);

  const binaryPredictions = tf.tidy(() => { // Use tf.tidy for memory management
    // Get the probability of the first class (index 0)
    const firstComponentProbabilities = predictions.slice([0, 0], [-1, 1]);

    // Compare probabilities to 0.5 and convert to binary (0 or 1)
    const binaryTensor = firstComponentProbabilities.less(0.5).logicalNot().toInt();

    return binaryTensor.arraySync(); // Convert the tensor to a Javascript array
  });

  // Flatten the array if it's nested due to slice operation
  return binaryPredictions.flat();
}
