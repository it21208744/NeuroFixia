# NeuroFixia

[![Overall diagram](Overall diagram "Overall diagram")](https://drive.google.com/file/d/1Xg3KBgi8hnE7NGpsS26itPCp0x-fh9Y0/view?usp=sharing "Overall diagram")

The system depicted in the diagram is designed to assist in the early identification and intervention of autism-related impairments in children. Parents and children provide input data, such as eye-tracking, body movement, activity results, video recordings, and responses. This data is processed through an API (REST API), then undergoes preprocessing, including feature extraction and labeling . The system uses machine learning models to identify impairments and assess risk levels based on sensory processing differences, facial expression analysis (using TensorFlow), cognitive aspects like attention, memory, and logical thinking , as well as parental questionnaire response analysis (using NLP and machine learning). Based on these assessments, the system recommends consulting with a medical professional for further evaluation. And the system provides a range of improvement activities that parents can choose to guide their child through, should they wish to do so. These activities are continually tracked and monitored (using mongoDB), ensuring that the child's progress is effectively observed. The approach leverages advanced technologies to create a comprehensive, personalized plan for each child, providing ongoing support to parents in their efforts to enhance their child's development


Dependencies - 
- Mediapipe
- tensorflow
- Sklearn

