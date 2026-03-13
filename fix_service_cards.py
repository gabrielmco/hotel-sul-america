import re

path = "styles/pagRestaurante/restaurante.scss"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

def replace_service_card(text):
    old_css = """    /* Linha decorativa */
    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 4px;
      background: linear-gradient(90deg, transparent, $primary, transparent);
      transition: width 0.6s ease;
      z-index: 4;
    }

    /* Efeitos de Hover no Card */
    &:hover {
      transform: translateY(-15px);
      box-shadow: 0 25px 60px rgba($primary, 0.2);

      &::before {
        opacity: 1;
      }

      img {
        transform: scale(1.1);
      }

      .overlay {
        .icon-wrapper {
          background: rgba($primary, 0.2);
          border-color: $primary;
          transform: translateY(-10px) scale(1.1);

          i {
            color: $secundary;
            transform: scale(1.2);
          }
        }

        h3 {
          transform: translateY(-5px);
        }
      }

      &::after {
        width: 80%;
      }

      .card-number {
        transform: scale(1.15) rotate(10deg);
        background: $primary;
        color: $white;
      }
    }"""
    
    new_css = """    /* Linha decorativa */
    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 4px;
      background: linear-gradient(90deg, transparent, $white, transparent);
      transition: width 0.6s ease;
      z-index: 4;
    }

    /* Efeitos de Hover no Card */
    &:hover {
      transform: translateY(-15px);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);

      &::before {
        opacity: 1;
      }

      img {
        transform: scale(1.1);
      }

      .overlay {
        .icon-wrapper {
          background: rgba(255, 255, 255, 0.2);
          border-color: $white;
          transform: translateY(-10px) scale(1.1);

          i {
            color: $white;
            transform: scale(1.2);
          }
        }

        h3 {
          transform: translateY(-5px);
        }
      }

      &::after {
        width: 80%;
      }

      .card-number {
        transform: scale(1.15) rotate(10deg);
        background: $black;
        color: $white;
      }
    }"""
    
    # Check specifically for the ".card-number" original standard color
    text = text.replace("color: $primary;", "color: $black;")
    return text.replace(old_css, new_css)

content = replace_service_card(content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("service-card updated")
