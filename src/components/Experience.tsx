import React from 'react';
import './Experience.css';

interface ExperienceProps {
  experience: any[];
}

const Experience: React.FC<ExperienceProps> = ({ experience }) => {
  return (
    <section id="experience" className="experience">
      <div className="container">
        <h2 className="section-title">Leadership & Experience</h2>
        <div className="timeline">
          {experience.map((item, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <h3 className="role">{item.role}</h3>
                  <span className="duration mono">{item.duration}</span>
                </div>
                <h4 className="organization">{item.organization}</h4>
                <ul className="description">
                  {item.description.map((desc: string, i: number) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
