import base64
from io import BytesIO

import numpy as np
import requests
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS


# Hopfield Network Implementation
class HopfieldNetwork:
    def __init__(self, size):
        self.size = size
        self.dimensions_size = int(np.sqrt(size))
        self.weights = np.zeros((size, size), dtype=np.int8)

    def add_pattern(self, pattern):
        pattern = np.array(pattern, dtype=np.int8)
        print('add_pattern', pattern)
        print('pattern:shape', pattern.shape)
        self.weights += np.outer(pattern, pattern).astype(np.int8) - np.identity(self.size,
                                                                                 dtype=np.int8)

    def recognize(self, pattern):
        pattern = np.array(pattern, dtype=np.int8).flatten()

        for _ in range(10):  # iteration limit to avoid infinite loops
            new_pattern = np.sign(self.weights @ pattern).astype(np.int8)

            if np.array_equal(new_pattern, pattern):
                break

            pattern = new_pattern.copy()

        return pattern.tolist()

    def recognize_explicitly(self, pattern):
        pattern = np.array(pattern, dtype=np.int8).flatten()
        new_pattern = pattern.copy()

        for _ in range(10):  # iteration limit to avoid infinite loops
            for i in range(self.size):
                weighted_sum = 0
                for j in range(self.size):
                    weighted_sum += self.weights[i, j] * pattern[j]

                new_pattern[i] = 1 if weighted_sum > 0 else -1

            if np.array_equal(new_pattern, pattern):
                break

            pattern = new_pattern.copy()

        return pattern.tolist()


# Flask Application
app = Flask(__name__)
CORS(app)
hopfield_network = HopfieldNetwork(40000)
stored_patterns = []


def rgba_to_binary(image_array):
    new_array = []

    for pixel in image_array:
        new_array.append(1 if pixel[3] <= 70 else -1)

    return np.array(new_array).astype(np.int8)


def flatten_image(image_array):
    new_array = []

    for row in image_array:
        for pixel in row:
            new_array.append(pixel)

    return np.array(new_array).astype(np.uint8)


# Convert image URL to black-white pattern
def process_image(url):
    if url.startswith('data:image/'):  # Check if it's a base64 encoded image
        # Extracting base64 data from the URL
        base64_data = url.split(',')[1]
        image_data = base64.b64decode(base64_data)
        image = Image.open(BytesIO(image_data)).convert('RGBA')
    else:
        response = requests.get(url)
        image = Image.open(BytesIO(response.content))

    bw_pattern = rgba_to_binary(flatten_image(np.array(image)))  # Convert to binary pattern
    return bw_pattern.reshape(hopfield_network.dimensions_size, hopfield_network.dimensions_size)


def pattern_to_image(pattern,
                     size=(hopfield_network.dimensions_size, hopfield_network.dimensions_size)):
    """Convert a binary pattern to an image."""
    image_array = ((np.array(pattern).reshape(size) + 1) / 2) * 255
    image = Image.fromarray(np.uint8(image_array), 'L')
    return image


def image_to_base64(image):
    """Convert an image to a base64 encoded string."""
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode()


@app.route('/add_pattern', methods=['POST'])
def add_pattern():
    url = request.json['pattern']
    pattern = process_image(url)
    hopfield_network.add_pattern(pattern)
    stored_patterns.append(url)
    return jsonify({'added_pattern': url})


@app.route('/recognize_pattern', methods=['POST'])
def recognize_pattern():
    url = request.json['pattern']
    pattern = process_image(url)
    recognized_pattern = hopfield_network.recognize(pattern)

    # Convert the recognized pattern to an image and then to a base64 URL
    recognized_image = pattern_to_image(recognized_pattern)
    base64_url = image_to_base64(recognized_image)

    return jsonify({'pattern': base64_url})


@app.route('/neurons', methods=['GET'])
def get_neurons():
    return jsonify({'neurons': hopfield_network.size})


@app.route('/neurons', methods=['POST'])
def set_neurons():
    size = request.json['neurons']
    hopfield_network.size = size
    hopfield_network.dimensions_size = int(np.sqrt(size))
    hopfield_network.weights = np.zeros((size, size), dtype=np.int8)
    stored_patterns.clear()
    return jsonify({'neurons': hopfield_network.size})


@app.route('/patterns', methods=['GET'])
def get_patterns():
    return jsonify({'patterns': stored_patterns})


if __name__ == '__main__':
    app.run(debug=True)
