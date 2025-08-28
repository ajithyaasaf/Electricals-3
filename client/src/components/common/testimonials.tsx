import { Star } from "lucide-react";
import tamilWomanImg from '@assets/generated_images/Tamil_woman_professional_headshot_47292604.png';
import tamilManImg from '@assets/generated_images/Tamil_man_professional_headshot_eaccc571.png';
import tamilManCasualImg from '@assets/generated_images/Tamil_man_casual_headshot_689dc8d0.png';

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Priya Lakshmi",
      role: "Residential Customer",
      rating: 5,
      comment: "Excellent service! The electrician was professional, knowledgeable, and completed the panel upgrade efficiently. High-quality products and fair pricing.",
      image: tamilWomanImg
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "Commercial Contractor",
      rating: 5,
      comment: "CopperBear has been our go-to for all electrical supplies and services. Their products are top-notch and the technical support is outstanding.",
      image: tamilManImg
    },
    {
      id: 3,
      name: "Murugan Selvam",
      role: "Maintenance Manager",
      rating: 5,
      comment: "Fast shipping, competitive prices, and excellent customer service. The online ordering system is user-friendly and the products always arrive as described.",
      image: tamilManCasualImg
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h3>
          <p className="text-lg text-gray-600">Trusted by thousands of satisfied customers across the region</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex text-yellow-400 mb-4 text-lg">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">"{testimonial.comment}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
